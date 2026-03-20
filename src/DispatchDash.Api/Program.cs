using DispatchDash.Api.Endpoints;
using DispatchDash.Api.Hubs;
using DispatchDash.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();
builder.Services.AddSingleton<ScoringService>();
builder.Services.AddSingleton<FeasibilityChecker>();
builder.Services.AddSingleton<GameManager>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGameEndpoints();
app.MapRoundEndpoints();
app.MapHub<GameHub>("/hub/game");

app.MapFallbackToFile("index.html");

app.Run();
