namespace DispatchDash.Api.Models;

public enum TimeWindow { None, Morning, Afternoon }

public record Customer(
    string Id,
    string Name,
    double Lat,
    double Lon,
    int Demand,
    TimeWindow TimeWindow = TimeWindow.None,
    bool IsRushOrder = false);
