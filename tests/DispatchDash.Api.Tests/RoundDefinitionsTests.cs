using DispatchDash.Api.Data;
using DispatchDash.Api.Models;

namespace DispatchDash.Api.Tests;

public class RoundDefinitionsTests
{
    [Fact]
    public void Round1_Has15Customers_1Vehicle_NoCapacity()
    {
        var round = RoundDefinitions.Round1();
        Assert.Equal(15, round.Customers.Count);
        Assert.Single(round.Vehicles);
        Assert.Equal(int.MaxValue, round.Vehicles[0].Capacity);
        Assert.Equal(60, round.TimerSeconds);
    }

    [Fact]
    public void Round2_Has20Customers_4Vehicles_WithTimeWindows()
    {
        var round = RoundDefinitions.Round2();
        Assert.Equal(20, round.Customers.Count);
        Assert.Equal(4, round.Vehicles.Count);
        Assert.All(round.Vehicles, v => Assert.Equal(20, v.Capacity));
        var twCustomers = round.Customers.Where(c => c.TimeWindow != TimeWindow.None).ToList();
        Assert.Equal(8, twCustomers.Count); // B,F,J,P morning; D,G,L,R afternoon
    }

    [Fact]
    public void Round3_Has30Customers_InfeasibleCapacity()
    {
        var round = RoundDefinitions.Round3();
        Assert.Equal(30, round.Customers.Count); // 15 base + 5 extra + 10 rush orders
        var totalCapacity = round.Vehicles.Sum(v => v.Capacity);
        var totalDemand = round.Customers.Sum(c => c.Demand);
        Assert.Equal(70, totalCapacity);
        Assert.Equal(107, totalDemand);
        Assert.True(totalDemand > totalCapacity, "Round 3 must be infeasible");
    }

    [Fact]
    public void Round3_HasTrafficSegment()
    {
        var round = RoundDefinitions.Round3();
        Assert.Single(round.TrafficSegments);
        var seg = round.TrafficSegments[0];
        Assert.Equal("G", seg.FromId);
        Assert.Equal("H", seg.ToId);
        Assert.Equal(2.0, seg.Multiplier);
    }
}
