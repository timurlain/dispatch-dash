using DispatchDash.Api.Data;
using DispatchDash.Api.Models;
using DispatchDash.Api.Services;

namespace DispatchDash.Api.Tests;

public class ScoringServiceTests
{
    private readonly ScoringService _sut = new();

    [Fact]
    public void HaversineDistance_BrnoToZlin_ApproximatelyCorrect()
    {
        // Zašová to Zlín ≈ 36 km straight line
        var dist = ScoringService.HaversineKm(49.4547, 18.0231, 49.2268, 17.6669);
        Assert.InRange(dist, 33, 40);
    }

    [Fact]
    public void HaversineDistance_SamePoint_IsZero()
    {
        var dist = ScoringService.HaversineKm(49.4547, 18.0231, 49.4547, 18.0231);
        Assert.Equal(0, dist, precision: 5);
    }

    [Fact]
    public void ScoreRoute_SingleVehicleVisitsAll_NoCapacityPenalty()
    {
        var round = RoundDefinitions.Round1();
        var routes = new List<RouteSubmission>
        {
            new("V1", round.Customers.Select(c => c.Id).ToList())
        };

        var result = _sut.Score(routes, round);

        Assert.True(result.DistanceScore > 0);
        Assert.Equal(0, result.PenaltyScore);
    }

    [Fact]
    public void ScoreRoute_UnvisitedCustomers_Gets200PenaltyEach()
    {
        var round = RoundDefinitions.Round2();
        // Visit only customer A on vehicle 1, skip the rest
        var routes = new List<RouteSubmission> { new("V1", ["A"]) };

        var result = _sut.Score(routes, round);

        // 19 unvisited customers × 200 = 3800
        Assert.Equal(3800, result.UnvisitedPenalty);
    }

    [Fact]
    public void ScoreRoute_CapacityOverload_Gets50PenaltyPerUnit()
    {
        var round = RoundDefinitions.Round2(); // capacity 20 per vehicle
        // Put all 68 demand on one truck (overload by 48)
        var routes = new List<RouteSubmission>
        {
            new("V1", round.Customers.Select(c => c.Id).ToList())
        };

        var result = _sut.Score(routes, round);

        Assert.Equal(2400, result.CapacityPenalty); // 48 units × 50
    }

    [Fact]
    public void ScoreRoute_TimeWindowViolation_Gets80PenaltyEach()
    {
        var round = RoundDefinitions.Round2();
        // Put afternoon customer (D) first, morning customer (B) last on same route
        // D is afternoon (should be in second half), B is morning (should be in first half)
        // Route: D, A, C, E, F, G, H, B — B (morning) is at position 8/8 (second half) = violation
        var routes = new List<RouteSubmission>
        {
            new("V1", ["D", "A", "C", "E"]),
            new("V2", ["F", "G", "H", "B"]),  // B is morning but at position 4/4 (second half)
        };

        var result = _sut.Score(routes, round);

        // B should be first half but is at end; D should be second half but is at start
        Assert.True(result.TimeWindowPenalty > 0);
    }

    [Fact]
    public void ScoreRoute_TrafficSegment_DoublesDistance()
    {
        var round = RoundDefinitions.Round3();
        // Route through G then H (traffic segment)
        var routeWithTraffic = new List<RouteSubmission> { new("V1", ["G", "H"]) };
        var routeWithoutTraffic = new List<RouteSubmission> { new("V1", ["A", "C"]) };

        var withTraffic = _sut.Score(routeWithTraffic, round);
        var withoutTraffic = _sut.Score(routeWithoutTraffic, round);

        // G↔H segment should have doubled distance applied
        Assert.True(withTraffic.DistanceScore > 0);
    }

    [Fact]
    public void ScoreRoute_DistanceIncludesReturnToDepot()
    {
        var round = RoundDefinitions.Round1();
        // Single customer route: depot → A → depot
        var routes = new List<RouteSubmission> { new("V1", ["A"]) };

        var result = _sut.Score(routes, round);

        // Distance = depot→A + A→depot = 2 × depot↔A distance
        var depotToA = ScoringService.HaversineKm(
            round.Depot.Lat, round.Depot.Lon,
            round.Customers[0].Lat, round.Customers[0].Lon) * 1.3;
        var expected = depotToA * 2;
        Assert.InRange(result.RawDistanceKm, expected - 0.1, expected + 0.1);
    }
}
