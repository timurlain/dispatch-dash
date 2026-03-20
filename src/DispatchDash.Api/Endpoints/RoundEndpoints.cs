namespace DispatchDash.Api.Endpoints;

using DispatchDash.Api.Services;

public static class RoundEndpoints
{
    public static void MapRoundEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/round");

        group.MapGet("/config/{roundNumber:int}", (int roundNumber, GameManager gm) =>
        {
            var analysis = gm.AnalyzeRound(roundNumber);
            return Results.Ok(analysis);
        });
    }
}
