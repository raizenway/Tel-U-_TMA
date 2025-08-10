    'use client';

    import { useState, useEffect } from "react";

    export default function CounteryPage() {
        const [country, setCountry] = useState<any>(null);
        const [loading, setLoading] = useState(true);
        const [error, setError ] = useState<string | null>(null);

        useEffect(() => {
            fetch('https://restcountries.com/v3.1/name/indonesia')
            .then(res => {
                if (!res.ok) throw new Error('Gagal');
                return res.json();
            })
            .then(data => {
                setCountry(data[0]);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
        
    }, []); 

    if (loading) return <p className="p-6">memuat data ....</p>;
    if (error) return <p className="p-6 text-gray-600">Error : {error}</p>;

    return (
        <div className="p-6 max-w-4xl mx-auto  min-h-screen">
       
            <h1 className="text-3xl font-bold text-gray-600 mb-6">informasi Negara: {country.name.common}</h1>
                <div className="rounded-lg p-4 ">
                                     <img
                            src={country.coatOfArms.png}
                             alt="Coat of Arms of Indonesia" 
                                className="w-40 h-40 object-contain"
                                    />
                                     <img
                            src={country.flags.png}
                            alt={country.flags.alt ||"flag of indonesia"}
                            className="w-130 h-50 object-cover "
                                     />
                            
                 </div>
            <table className="w-full bg-white border border-gray-300 rounded-lg shdow-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="py-3 px-6 text-left font-semibold text-gray-700">Kolom</th>
                        <th className="py-3 px-6 text-left font-semibold text-gray-700">Nilai</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    <tr>
                        <td className="py-3 px-6 font-medium text-gray-600">Name (Common)</td>
                        <td className="py-3 px-6">{country.name.common}</td>
                    </tr>
                    <tr>
                        <td className="py-3 px-6 font-medium text-gray-600">Name (Official)</td>
                        <td className="py-3 px-6">{country.name.official}</td>
                    </tr>
                    <tr>
                        <td className="py-3 px-6 font-medium text-gray-600">Capital</td>
                        <td className="py-3 px-6">{country.capital?.[0] || 'Tidak ada'}</td>
                    </tr>
                    <tr>
                        <td className="py-3 px-6 font-medium text-gray-600">Region</td>
                        <td className="py-3 px-6">{country.region}</td>
                    </tr>
                    <tr>
                        <td className="py-3 px-6 font-medium text-gray-600">Subregion</td>
                        <td className="py-3 px-6 ">{country.subregion}</td>
                    </tr>
                    <tr>
                        <td className="py-3 px-6 font-medium text-gray-600">Languages</td>
                        <td className="py-3 px-6">{country.languages
                            ? Object.values(country.languages).join (', ')
                        : 'tidak diketahui'}
                        </td>
                    </tr>
                    <tr>
                        <td className="py-3 px-6 font-medium text-gray-600">Population</td>
                        <td className="py-3 px-6">{country.population.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td className="py-3 px-6 font-medium text-gray-600">Timezone</td>
                        <td className="py-3 px-6">{country.timezones.join(', ')}</td>
                    </tr>
                   <tr>
                        <td className="py-3 px-6 font-medium text-gray-600">Start of Week</td>
                        <td className="py-3 px-6">{country.startOfWeek || 'Tidak diketahui'}</td>
                        </tr>
                        <tr>
                                <img
                                src={country.coactOfArms}
                                />
                        </tr>
                </tbody>
            </table>

        </div>
    );
    }