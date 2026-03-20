namespace DispatchDash.Api.Endpoints;

using DispatchDash.Api.Services;

public static class GameEndpoints
{
    public static void MapGameEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/game");

        group.MapPost("/create", (GameManager gm) =>
        {
            var code = gm.CreateGame();
            return Results.Ok(new { roomCode = code });
        });

        group.MapGet("/{roomCode}", (string roomCode, GameManager gm) =>
        {
            var game = gm.GetGame(roomCode);
            if (game is null) return Results.NotFound();
            return Results.Ok(new
            {
                game.RoomCode,
                game.Phase,
                game.CurrentRound,
                PlayerCount = game.Players.Count,
                Players = game.Players.Values.Select(p => new { p.Id, p.Name })
            });
        });

        group.MapGet("/{roomCode}/leaderboard", (string roomCode, GameManager gm) =>
        {
            var lb = gm.GetLeaderboard(roomCode);
            return Results.Ok(lb);
        });
    }
}
