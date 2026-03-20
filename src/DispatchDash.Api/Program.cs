using System.Text.Json;
using System.Text.Json.Serialization;
using DispatchDash.Api.Endpoints;
using DispatchDash.Api.Hubs;
using DispatchDash.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Serialize enums as camelCase strings (e.g. TimeWindow.Morning → "morning")
var enumConverter = new JsonStringEnumConverter(JsonNamingPolicy.CamelCase);

builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
    {
        options.PayloadSerializerOptions.Converters.Add(enumConverter);
    });

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(enumConverter);
});
builder.Services.AddSingleton<ScoringService>();
builder.Services.AddSingleton<FeasibilityChecker>();
builder.Services.AddSingleton<GameManager>();
builder.Services.AddSingleton<GameTimerService>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGameEndpoints();
app.MapRoundEndpoints();
app.MapHub<GameHub>("/hub/game");

app.MapFallbackToFile("index.html");

app.Run();
