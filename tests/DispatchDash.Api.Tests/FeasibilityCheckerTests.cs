using DispatchDash.Api.Data;
using DispatchDash.Api.Models;
using DispatchDash.Api.Services;

namespace DispatchDash.Api.Tests;

public class FeasibilityCheckerTests
{
    private readonly FeasibilityChecker _sut = new();

    [Fact]
    public void Round1_IsFeasible()
    {
        var result = _sut.Analyze(RoundDefinitions.Round1());
        Assert.True(result.IsFeasible);
        Assert.Equal(0, result.CapacityShortfall);
    }

    [Fact]
    public void Round2_IsFeasible()
    {
        var result = _sut.Analyze(RoundDefinitions.Round2());
        Assert.True(result.IsFeasible);
    }

    [Fact]
    public void Round3_IsInfeasible()
    {
        var result = _sut.Analyze(RoundDefinitions.Round3());
        Assert.False(result.IsFeasible);
        Assert.Equal(37, result.CapacityShortfall);
        Assert.Equal(107, result.TotalDemand);
        Assert.Equal(70, result.TotalCapacity);
    }

    [Fact]
    public void Round3_TheoreticalMinPenalty_IsPositive()
    {
        var result = _sut.Analyze(RoundDefinitions.Round3());
        Assert.True(result.TheoreticalMinPenalty > 0);
    }
}
