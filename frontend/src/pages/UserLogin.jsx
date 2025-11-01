import React , {useState , useContext} from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import  {UserContextData}  from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { FacebookIcon, RectangleGogglesIcon, TwitchIcon } from "lucide-react";

const UserLogin = () => {
    const [email ,setEmail] = React.useState("");
    const [password ,setPassword] = React.useState("");
    const [userData, setUserData] = React.useState({});

    const navigate = useNavigate();
    const {user, setUser} = useContext(UserContextData);

    const submitHandler = async (e) => {
    e.preventDefault();
    const loginData = {
        email: email,
        password: password,
    };

    try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, loginData);

        if(response.status === 200) {
            const data = response.data;
            setUser(data.user);
            localStorage.setItem("token", data.token);
            navigate("/");
        }
        setEmail("");
        setPassword("");
    } catch (error) {
        if (error.response && error.response.data && error.response.data.errors) {
            alert(error.response.data.errors.map(e => e.msg).join('\n'));
        } else if (error.response && error.response.data && error.response.data.message) {
            alert(error.response.data.message);
        } else {
            alert("Login failed");
        }
        console.error(error);
    }
};


    return (
        <div className="bg-[url('/LR.png')] bg-cover bg-no-repeat h-screen bg-center">
            <div className="p-7 h-screen ml-[50%]">
            <div className="flex flex-col relative z-[10]">
                <h1 className="text-2xl font-semibold mt-7">Sign in</h1>
                <div className="border w-[80%] rounded-3xl flex p-2 gap-2 mt-8 justify-center">
                    <img src="https://www.svgrepo.com/show/353817/google-icon.svg" className="h-5 mt-[1%]" alt="google" />
                    <h3 className="text-center">Continue with Google</h3>
                </div>
                <div className="border w-[80%] rounded-3xl text-center flex p-2 gap-2 mt-3 justify-center">
                    <img src="https://www.svgrepo.com/show/303127/twitter-logo.svg" className="h-5 mt-[1%]" alt="google" />
                    <h3>Continue with Twitter</h3>
                </div>
                <span className="flex gap-2 mt-10"><p className="border w-[40%] h-0 mt-3"></p> OR <p className="border w-[40%] h-0 mt-3"></p></span>
            </div>
          <div className="mt-10">
            <form onSubmit={(e) =>{
                submitHandler(e);
            }}>
                <h3 className=" text-lg font-medium mb-2">What is your email</h3>
                <input className="bg-[#eeeeee] mb-7 w-[80%] rounded-xl px-4 py-2 border border-gray-400 text-lg placeholder:text-base" 
                    required 
                    type="email"  
                    placeholder="email@example.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                />
                <h3 className=" text-lg font-medium mb-2">Enter password</h3>
                <input className="bg-[#eeeeee] mb-7 w-[80%] rounded-xl px-4 py-2 border border-gray-400 text-lg placeholder:text-base" 
                required 
                type="password" 
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                <br />
                <button className="bg-[#FE6187] text-white font-semibold mb-3 rounded-3xl px-4 py-2 w-[30%] text-lg placeholder:text-base">Login</button>
            </form>
            <p className="">New here? <Link to="/signup" className="text-blue-600">Create new Account</Link></p>
          </div>
        </div>
        </div>
    );
}

export default UserLogin;