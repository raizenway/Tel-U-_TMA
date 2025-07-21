"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <div className="container">
      {/* Background Bubble */}
      <div className="background">
        <div className="circle blue" />
        <div className="circle pink" />
        <div className="circle violet" />
      </div>

      {/* Login Card */}
      <div className="card">
        <Image
          src="/Logo.png"
          alt="Logo Telkom University"
          width={90}
          height={90}
          className="logo"
        />

        <h1>Selamat Datang 🎓</h1>
        <p>
          Di <span>Sistem Akademik Mahasiswa</span>
          <br />
          Telkom University
        </p>

        <div className="user-img">
          <Image src="/user-icon.png" alt="Ilustrasi Mahasiswa" fill />
        </div>

        <button onClick={handleLoginRedirect}>Masuk</button>

        <footer>
          &copy; {new Date().getFullYear()} Telkom University. All rights reserved.
        </footer>
      </div>

      <style jsx>{`
        .container {
          position: relative;
          min-height: 100vh;
          background: linear-gradient(135deg, #e0f2fe, #f8fafc);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          overflow: hidden;
        }

        .background {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.3;
        }

        .blue {
          width: 260px;
          height: 260px;
          background: #93c5fd;
          top: 8%;
          left: 5%;
          animation: pulse 7s infinite;
        }

        .pink {
          width: 320px;
          height: 320px;
          background: #fbcfe8;
          bottom: 4%;
          right: 6%;
          animation: ping 9s infinite;
        }

        .violet {
          width: 200px;
          height: 200px;
          background: #ddd6fe;
          top: 48%;
          left: 42%;
          transform: rotate(15deg);
        }

        .card {
          position: relative;
          z-index: 10;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          border-radius: 2rem;
          padding: 3rem;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
          text-align: center;
          animation: fadeInUp 0.8s ease-out;
        }

        .logo {
          display: block;
          margin: 0 auto 1.5rem;
          filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.2));
        }

        h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        p {
          font-size: 1.1rem;
          color: #334155;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        p span {
          color: #1d4ed8;
          font-weight: 600;
        }

        .user-img {
          position: relative;
          width: 220px;
          height: 220px;
          margin: 0 auto 2rem;
        }

        button {
          background: linear-gradient(to right, #1d4ed8, #6366f1);
          color: white;
          border: none;
          padding: 0.85rem 2.2rem;
          border-radius: 1.5rem;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }

        button:hover {
          transform: scale(1.06);
          box-shadow: 0 12px 30px rgba(99, 102, 241, 0.6);
        }

        footer {
          margin-top: 2rem;
          font-size: 0.75rem;
          color: #64748b;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ping {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.12);
            opacity: 0.1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.07);
            opacity: 0.15;
          }
        }
      `}</style>
    </div>
  );
}
