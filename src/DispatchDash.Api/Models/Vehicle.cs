namespace DispatchDash.Api.Models;

public record Vehicle(string Id, int Capacity, int PreloadedUnits = 0)
{
    public int RemainingCapacity => Capacity - PreloadedUnits;
}
