import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="bg-white border-2 border-black rounded-lg p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 w-full">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto mb-6">
            <Image 
              src="/logo.png"
              alt="SGC Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-center mb-4">
            Welcome to the SGC Attendance System
            <span className="block text-lg sm:text-xl md:text-2xl mt-2 text-gray-600">
              Admin Portal
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Link
            href="/admin/login"
            className="group bg-white border-2 border-black rounded-lg p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex flex-col h-full">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight group-hover:underline mb-4">
                Admin Login &rarr;
              </h3>
              <p className="text-base sm:text-lg text-gray-600">
                Login to manage attendance and members
              </p>
            </div>
          </Link>

          <Link
            href="/member"
            className="group bg-white border-2 border-black rounded-lg p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex flex-col h-full">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight group-hover:underline mb-4">
                Member Portal &rarr;
              </h3>
              <p className="text-base sm:text-lg text-gray-600">
                View your attendance records
              </p>
            </div>
          </Link>
        </div>
      </main>
      <div className="mt-8 text-center text-gray-500 text-xs">
        <p>This Site was Developed and Maintained by SGC</p>
          <p>&copy; {new Date().getFullYear()} Students Guidance Cell - CAHCET. All Rights Reserved</p>
        </div>
    </div>
  )
}