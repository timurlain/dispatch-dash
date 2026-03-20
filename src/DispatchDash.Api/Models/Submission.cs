namespace DispatchDash.Api.Models;

public record RouteSubmission(string VehicleId, List<string> CustomerIds);

public record Submission(
    string PlayerId,
    int RoundNumber,
    List<RouteSubmission> Routes,
    double? Score = null,
    double? DistanceScore = null,
    double? PenaltyScore = null,
    int? Rank = null);
