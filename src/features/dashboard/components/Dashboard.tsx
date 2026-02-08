import { cn } from "@/lib/utils";
import { useUser } from "@/shared/hooks/useUser";

export const Dashboard = () => {
  const { user, defaultHotelId, isLoading, error } = useUser();

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  if (!user) {
    return <div className="p-6">No user data available</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="space-y-2">
        {user.hotels.length > 0 ? (
          user.hotels.map((hotel) => (
            <div
              key={hotel.id}
              className={cn(
                "p-3 rounded border",
                hotel.id === defaultHotelId
                  ? " bg-primary/5 font-medium"
                  : "border-border"
              )}
            >
              {hotel.name}
              {hotel.id === defaultHotelId && (
                <span className="ml-2 text-xs text-primary">(Default)</span>
              )}
            </div>
          ))
        ) : (
          <div className="text-muted-foreground">No hotels found</div>
        )}
      </div>

      {defaultHotelId && (
        <div className="mt-6 text-sm text-muted-foreground">
          Current default hotel ID: <span className="font-mono">{defaultHotelId}</span>
        </div>
      )}
    </div>
  );
};