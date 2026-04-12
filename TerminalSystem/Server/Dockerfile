# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the .csproj and restore dependencies
COPY ["Server.csproj", "./"]
RUN dotnet restore "Server.csproj"

# Copy the remaining project files and publish
COPY . .
RUN dotnet publish "Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy the published output from the build stage
COPY --from=build /app/publish .

# Expose the standard ASP.NET Core port
EXPOSE 8080

# Configure the entry point
ENTRYPOINT ["dotnet", "Server.dll"]
