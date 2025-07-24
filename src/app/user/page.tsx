"use client";

import { useState } from "react";

interface UserItem {
  id: number;
  userId: string;
  username: string;
  password: string;
  namaUser: string;
  role: string;
}

export default function UserPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dataPerPage = 10;

  const [data, setData] = useState<UserItem[]>([]); // Kosong dulu

  const totalPage = Math.max(1, Math.ceil(data.length / dataPerPage));

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPage) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddUser = (role: string) => {
    // Simulasi nambah data dummy
    const newUser: UserItem = {
      id: data.length + 1,
      userId: (Math.floor(Math.random() * 100000)).toString(),
      username: `User${data.length + 1}`,
      password: "password123",
      namaUser: `Nama User ${data.length + 1}`,
      role: role,
    };
    setData([...data, newUser]);
    setShowDropdown(false);
  };

  const indexOfLast = currentPage * dataPerPage;
  const indexOfFirst = indexOfLast - dataPerPage;
  const currentData = data.slice(indexOfFirst, indexOfLast);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-bold mb-4 uppercase">
        Transformation Maturity Assessment Dashboard
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-lg overflow-auto">
        {/* Filter & Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Cari"
            className="border px-3 py-1 rounded w-1/4"
          />
          <div className="flex gap-2 relative">
            <button className="bg-gray-200 px-3 py-1 rounded">Copy</button>
            <button className="bg-gray-200 px-3 py-1 rounded">Print</button>
            <button className="bg-gray-200 px-3 py-1 rounded">Download</button>
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              Tambah User ▼
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-10 bg-white border rounded shadow-md w-32 z-20">
                <button
                  onClick={() => handleAddUser("UPPS/KC")}
                  className="block w-full text-left px-3 py-1 hover:bg-gray-100"
                >
                  UPPS/KC
                </button>
                <button
                  onClick={() => handleAddUser("Non SSO")}
                  className="block w-full text-left px-3 py-1 hover:bg-gray-100"
                >
                  Non SSO
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm border">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="border px-2 py-1">User ID</th>
              <th className="border px-2 py-1">User Name</th>
              <th className="border px-2 py-1">Password</th>
              <th className="border px-2 py-1">Nama User</th>
              <th className="border px-2 py-1">Role</th>
              <th className="border px-2 py-1 sticky right-0 bg-gray-200 z-10 text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Tidak ada data yang tersedia.
                </td>
              </tr>
            ) : (
              currentData.map((item) => (
                <tr key={item.id}>
                  <td className="border px-2 py-1">{item.userId}</td>
                  <td className="border px-2 py-1">{item.username}</td>
                  <td className="border px-2 py-1">
                    {"•".repeat(item.password.length)}
                  </td>
                  <td className="border px-2 py-1">{item.namaUser}</td>
                  <td className="border px-2 py-1">{item.role}</td>
                  <td className="border px-2 py-1 sticky right-0 bg-white z-10 text-center">
                    <div className="flex gap-2 justify-center">
                      <button className="text-blue-500 hover:underline">✏ Edit</button>
                      <button className="text-red-500 hover:underline">Deactivate</button>
                      <button className="text-green-500 hover:underline">Reactive</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <div>
            <select className="border px-2 py-1 rounded">
              <option>10 Data</option>
              <option>20 Data</option>
              <option>50 Data</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className={`bg-gray-200 px-2 py-1 rounded ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={currentPage === 1}
            >
              {"<"}
            </button>
            {Array.from({ length: totalPage }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageClick(i + 1)}
                className={`px-2 py-1 rounded ${
                  currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={handleNext}
              className={`bg-gray-200 px-2 py-1 rounded ${
                currentPage === totalPage ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={currentPage === totalPage}
            >
              {">"}
            </button>
          </div>
          <div>Total {data.length}</div>
        </div>
      </div>
    </div>
  );
}
