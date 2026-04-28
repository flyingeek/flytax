import airportsData from "../../data/airports.json";

export const iata2country = (iata) => {
    const index = airportsData.indexOf(iata + ':');
    return (index >= 0) ? airportsData.substring(index + 4, index + 6) : iata;
};
