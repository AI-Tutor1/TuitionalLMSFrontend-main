import React, { useMemo } from "react";
import styles from "./geographicDistribution.module.css";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import ChartContainer from "../chartContainer/chartContainer";

interface CountryData {
  country: string;
  count: number;
  percentage: string;
  coordinates?: [number, number]; // Longitude, Latitude
}

// Color scale for the map
const colorScale = scaleLinear<string>()
  .domain([0, 845]) // Min and max student counts
  .range(["#e6f7ff", "#0077cc"]); // Light blue to darker blue

const GeographicDistribution: React.FC<{
  data: { country: string | null; userCount: number | null }[];
  inLineStyles?: React.CSSProperties;
}> = ({ data, inLineStyles }) => {
  const addPercentages = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Coordinates mapping for countries
    const countryCoordinates: Record<string, [number, number]> = {
      "United States": [-95.7129, 37.0902],
      "United Kingdom": [-3.4359, 55.3781],
      "United Arab Emirates": [53.8478, 23.4241],
      Pakistan: [69.3451, 30.3753],
      "Saudi Arabia": [45.0792, 23.8859],
      Qatar: [51.183, 25.3548],
      Oman: [55.9233, 21.4735],
      Kuwait: [47.4818, 29.3117],
    };

    const totalUsers = data.reduce(
      (sum, item) => sum + (item.userCount || 0),
      0,
    );

    return data.map((item) => ({
      ...item,
      percentage: item.userCount
        ? `${Math.round((item.userCount / totalUsers) * 100)}%`
        : "0%",
      coordinates: item.country ? countryCoordinates[item.country] : undefined,
    }));
  }, [data]);

  // Create a mapping of country names to counts for the map coloring
  const countryToCount = useMemo(() => {
    if (!addPercentages || addPercentages.length === 0) return {};

    return addPercentages.reduce(
      (acc, { country, userCount }) => {
        if (country !== null) {
          acc[country] = userCount || 0;
        }
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [addPercentages]);

  // Get max count for dynamic color scaling
  const maxCount = useMemo(() => {
    const counts = Object.values(countryToCount);
    return counts.length > 0 ? Math.max(...counts) : 845;
  }, [countryToCount]);

  // Dynamic color scale
  const dynamicColorScale = useMemo(() => {
    return scaleLinear<string>()
      .domain([0, maxCount])
      .range(["#e6f7ff", "#0077cc"]);
  }, [maxCount]);

  // Filter data with coordinates for markers
  const markerData = useMemo(() => {
    return addPercentages.filter(
      (item) => item.coordinates && item.country !== null,
    );
  }, [addPercentages]);

  return (
    <ChartContainer
      title="Consumer Distribution"
      subtitle="Students by country"
      inLineStyles={inLineStyles}
    >
      <div className={styles.chartWrapper}>
        <div className={styles.mapContainer}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 130,
              center: [0, 0],
            }}
            width={1000}
            height={1000}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup>
              <Geographies geography="/world-110m.json">
                {({ geographies }: any) =>
                  geographies.map((geo: any) => {
                    const countryName = geo.properties.NAME;
                    // Color intensity based on student count
                    const fillColor = countryToCount[countryName]
                      ? dynamicColorScale(countryToCount[countryName])
                      : "#004771"; // Default color for countries without data
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillColor}
                        stroke="#D6D6DA"
                        style={{
                          default: {
                            outline: "none",
                          },
                          hover: {
                            outline: "none",
                            fill: "var(--main-blue-color)",
                          },
                          pressed: {
                            outline: "none",
                            fill: "#3b82f6",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
              {/* Add markers for each country with data */}
              {markerData.map(({ country, userCount, coordinates }) => {
                if (!coordinates || !country) return null;
                // Calculate marker size based on count
                const markerSize = Math.max(
                  4,
                  Math.min(12, (userCount || 0) / (maxCount / 12)),
                );
                return (
                  <Marker key={country} coordinates={coordinates}>
                    <circle
                      r={markerSize}
                      fill="var(--orange-text-color1)"
                      stroke="var(--main-white-color)"
                      strokeWidth={0.5}
                    />
                    <title>{`${country}: ${userCount} students`}</title>
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>
        </div>

        <div className={styles.countryListContainer}>
          <div className={styles.countryList}>
            {addPercentages?.map((item, index) => (
              <div
                key={item.country || `unknown-${index}`}
                className={styles.countryItem}
              >
                <div className={styles.countryNameWrapper}>
                  <div className={styles.countryDot}></div>
                  <span className={styles.countryName}>
                    {item.country || "Unknown"}
                  </span>
                </div>
                <div className={styles.countryMetrics}>
                  <span className={styles.countryCount}>{item.userCount}</span>
                  <div className={styles.progressBarBg}>
                    <div
                      className={styles.progressBarFill}
                      style={{ width: item.percentage }}
                    ></div>
                  </div>
                  <span className={styles.countryPercentage}>
                    {item.percentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ChartContainer>
  );
};

export default GeographicDistribution;
