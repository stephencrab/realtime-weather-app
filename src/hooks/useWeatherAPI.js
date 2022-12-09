import { useCallback, useEffect, useState } from "react";

const fetchCurrentWeather = ({AUTHORIZATION_KEY, locationName}) => {
    return fetch(
      `${process.env.REACT_APP_CurrentWeather_URL}?Authorization=${AUTHORIZATION_KEY}&locationName=${locationName}`
    )
      .then(res => res.json())
      .then(data => {
        const locationData = data.records.location[0];
        const weatherElements = locationData.weatherElement.reduce(
          (elements, item) => {
            if (['WDSD', 'TEMP'].includes(item.elementName)) {
              elements[item.elementName] = item.elementValue;
            }
            return elements;
          },
          {}
        );
  
        return {
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          locationName: locationData.locationName,
          observationTime: locationData.time.obsTime,
        };      
      });
  };
  
  const fetchWeatherForecast = ({AUTHORIZATION_KEY, cityName}) => {
    return fetch(
      `${process.env.REACT_APP_WeatherForecast_URL}?Authorization=${AUTHORIZATION_KEY}&locationName=${cityName}`
    )
      .then(res => res.json())
      .then(data => {
        const locationData = data.records.location[0];
        const weatherElements = locationData.weatherElement.reduce(
          (elements, item) => {
            if (['Wx', 'CI', 'PoP'].includes(item.elementName)) {
              elements[item.elementName] = item.time[0].parameter;
            }
            return elements;
          },
          {}
        );
  
        return {
          description: weatherElements.Wx.parameterName,
          weatherCode: weatherElements.Wx.parameterValue,
          rainPossibility: weatherElements.PoP.parameterName,
          comfortability: weatherElements.CI.parameterName,
        };
      });
  };

const useWeatherAPI = ({locationName, cityName, AUTHORIZATION_KEY}) => {
    const [weatherElement, setWeatherElement] = useState({
        locationName: '',
        description: '',
        temperature: 0,
        windSpeed: 0,
        rainPossibility: 0,
        observationTime: new Date(),
        isLoading: true,
        weatherCode: 0,
        comfortability: '',
      });

      const fetchData = useCallback(async () => {
        setWeatherElement(preState => ({
          ...preState,
          isLoading: true,
        }));  
    
        const [currentWeather, weatherForecast] = await Promise.all([
          fetchCurrentWeather({AUTHORIZATION_KEY, locationName}),
          fetchWeatherForecast({AUTHORIZATION_KEY, cityName}),
        ]);
        
        setWeatherElement((preState) => ({
          ...preState,
          ...currentWeather,
          ...weatherForecast,
          isLoading: false,
        }))
      }, [AUTHORIZATION_KEY, locationName, cityName]);
    
      useEffect(() => {   
        fetchData();   
      }, [fetchData]);

      return [weatherElement, fetchData]
}

export default useWeatherAPI;