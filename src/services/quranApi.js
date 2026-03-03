const BASE_URL = "https://api.alquran.cloud/v1";

export const getSurahList = () =>
    fetch(`${BASE_URL}/meta`).then(res => res.json());

export const getSurah = (number) =>
    fetch(
        `${BASE_URL}/surah/${number}/editions/quran-uthmani,id.indonesian,ar.alafasy`
    ).then(res => res.json());

export const searchAyah = (keyword, edition = "en.asad") =>
    fetch(`${BASE_URL}/search/${keyword}/all/${edition}`)
        .then(res => res.json());