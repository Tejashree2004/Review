FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Review.API.csproj ./
RUN dotnet restore Review.API.csproj

COPY . ./
RUN dotnet publish Review.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "dotnet Review.API.dll --urls http://0.0.0.0:${PORT:-8080}"]
