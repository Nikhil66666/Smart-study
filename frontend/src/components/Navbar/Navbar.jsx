import { FaBell } from "react-icons/fa";

function Navbar() {

    return (

        <header className="bg-white shadow px-8 py-5 flex justify-between items-center">

            <div>

                <h2 className="text-2xl font-bold">

                    Welcome back 👋

                </h2>

                <p className="text-gray-500">

                    Ready to study today?

                </p>

            </div>

            <div className="flex items-center gap-6">

                <FaBell
                    size={22}
                    className="cursor-pointer"
                />

                <div className="flex items-center gap-3">

                    <img

                        src="https://ui-avatars.com/api/?name=User"

                        alt="avatar"

                        className="w-10 h-10 rounded-full"

                    />

                    <div>

                        <h3 className="font-semibold">

                            Student

                        </h3>

                        <p className="text-sm text-gray-500">

                            Smart Learner

                        </p>

                    </div>

                </div>

            </div>

        </header>

    );

}

export default Navbar;