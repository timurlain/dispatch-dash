# Stage 1: Build React client
FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY src/dispatch-dash-client/package*.json ./
RUN npm ci
COPY src/dispatch-dash-client/ .
RUN npm run build

# Stage 2: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api-build
WORKDIR /app
COPY DispatchDash.slnx ./
COPY src/DispatchDash.Api/*.csproj src/DispatchDash.Api/
COPY tests/DispatchDash.Api.Tests/*.csproj tests/DispatchDash.Api.Tests/
RUN dotnet restore
COPY src/DispatchDash.Api/ src/DispatchDash.Api/
COPY tests/DispatchDash.Api.Tests/ tests/DispatchDash.Api.Tests/
RUN dotnet publish src/DispatchDash.Api/DispatchDash.Api.csproj -c Release -o /out

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=api-build /out .
COPY --from=client-build /app/client/dist ./wwwroot
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "DispatchDash.Api.dll"]
