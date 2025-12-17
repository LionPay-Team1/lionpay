using System.Diagnostics;
using System.Runtime.InteropServices;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace LionPay.AppHost;

public static class Extensions
{
    extension(IDistributedApplicationBuilder builder)
    {
        public IResourceBuilder<DynamoDbResource> AddLocalDynamoDb(string name)
        {
            // Configure dynamodb container used for local development
            var dynamodb = new DynamoDbResource(name);

            return builder.AddResource(dynamodb)
                .WithImage("amazon/dynamodb-local:latest")
                .WithImageRegistry("docker.io")
                .WithArgs("-jar", "DynamoDBLocal.jar", "-inMemory")
                .WithHttpEndpoint(targetPort: 8000, name: "http");
        }
    }

    public sealed class DynamoDbResource(string name) : ContainerResource(name), IResourceWithConnectionString
    {
        public ReferenceExpression ConnectionStringExpression => ReferenceExpression.Create($"http://{{{Name}}}");
    }

    extension(IResourceBuilder<JavaAppExecutableResource> builder)
    {
        public IResourceBuilder<JavaAppExecutableResource> WithGradleBuild(string? gradleCommand = null)
        {
            gradleCommand ??= RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "gradlew.bat" : "./gradlew";

            builder.ApplicationBuilder.Eventing.Subscribe<BeforeResourceStartedEvent>(builder.Resource, async (e, ct) =>
            {
                if (e.Resource is not JavaAppExecutableResource javaAppResource)
                {
                    return;
                }

                var logger = e.Services.GetRequiredService<ResourceLoggerService>().GetLogger(javaAppResource);
                var notificationService = e.Services.GetRequiredService<ResourceNotificationService>();

                await notificationService.PublishUpdateAsync(javaAppResource, state => state with
                {
                    State = new("Building with Gradle", KnownResourceStates.Starting)
                }).ConfigureAwait(false);

                logger.LogInformation("Building with Gradle");

                var gradleExecutable = Path.Combine(javaAppResource.WorkingDirectory, gradleCommand);

                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = gradleExecutable,
                        Arguments = "build -x test",
                        WorkingDirectory = javaAppResource.WorkingDirectory,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        CreateNoWindow = true,
                        UseShellExecute = false,
                    }
                };

                process.OutputDataReceived += async (_, args) =>
                {
                    if (!string.IsNullOrWhiteSpace(args.Data))
                    {
                        await notificationService.PublishUpdateAsync(javaAppResource, state => state with
                        {
                            State = new(args.Data, KnownResourceStates.Starting)
                        }).ConfigureAwait(false);

                        logger.LogInformation("{Data}", args.Data);
                    }
                };

                process.ErrorDataReceived += (_, args) =>
                {
                    if (!string.IsNullOrWhiteSpace(args.Data))
                    {
                        logger.LogError("{Data}", args.Data);
                    }
                };

                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                await process.WaitForExitAsync(ct).ConfigureAwait(false);

                if (process.ExitCode != 0)
                {
                    await notificationService.PublishUpdateAsync(javaAppResource, state => state with
                    {
                        State = new($"Gradle build failed with exit code {process.ExitCode}", KnownResourceStates.FailedToStart)
                    }).ConfigureAwait(false);

                    throw new Exception($"Gradle build failed with exit code {process.ExitCode}");
                }

                logger.LogInformation("Gradle build completed successfully");
            });

            return builder;
        }
    }
}
