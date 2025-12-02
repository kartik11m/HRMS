import React, {useState , useContext} from "react";
import { Link , useNavigate } from "react-router-dom";
import axios from "axios";
import  {UserContextData}  from "../context/UserContext";

const UserSignup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userData, setUserData] = useState({});

    const navigate = useNavigate();

    const {user, setUser} = React.useContext(UserContextData);

    const submitHandler = async (e) => {
        e.preventDefault(); // Prevent default form submission
        const newUser = {
            fullname: {
                firstname: firstName,
                lastname: lastName,
            },
            email: email,
            password: password,
        };

        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`, newUser);

        if(response.status === 201) {
            const data = response.data;
            // normalize and save user
            const userData = {
                _id: data.user._id,
                fullname: {
                    firstname: data.user.fullname?.firstname || "",
                    lastname: data.user.fullname?.lastname || ""
                },
                email: data.user.email || ""
            };
            setUser(userData);
            localStorage.setItem("token", data.token);
            navigate("/profile");
        }
        // setUserData({ 
        //     fullName:{
        //         firstName: firstName,   
        //         lastName: lastName,
        //     },
        //     email: email,
        //     password: password,
        // });
        // console.log("User Data:", userData);
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setPassword("");
    };
    return (
        <div className="bg-[url('/RightLight.png')] bg-cover bg-no-repeat h-screen bg-center border">
            <div className="p-7  flex flex-col w-[50%] ml-[10%] mt-[3%]">
            <h1 className="text-3xl font-semibold mb-10">Create an account</h1>
          <div>
            <form onSubmit={(e) => {
                submitHandler(e);}
                }>
                <h3 className=" text-lg font-medium mb-2">What is your name</h3>
                <div className="flex gap-4">
                    <input className="bg-[#eeeeee] mb-7 w-[80%] rounded-xl px-4 py-2 border border-gray-400 text-lg placeholder:text-base" 
                    required 
                    type="text"  
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <input className="bg-[#eeeeee] mb-7 w-[80%] rounded-xl px-4 py-2 border border-gray-400 text-lg placeholder:text-base" 
                    required 
                    type="text"  
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                </div>
                <h3 className=" text-lg font-medium mb-2">What is your email</h3>
                <input className="bg-[#eeeeee] mb-7 w-[80%] rounded-xl px-4 py-2 border border-gray-400 text-lg placeholder:text-base" 
                    required 
                    type="email"  
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <h3 className=" text-lg font-medium mb-2">Enter password</h3>
                <input className="bg-[#eeeeee] mb-4 w-[80%] rounded-xl px-4 py-2 border border-gray-400 text-lg placeholder:text-base" 
                required 
                type="password" 
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                <h4 className="mb-4">use 8 or more characters with mix of alphabets, <br /> symbols,numbers</h4>
                <h4 className="mb-4">By creating an account you agree with our <br /> term and condition</h4>
                <button className="bg-[#FE6187] text-white font-semibold mb-3 rounded-3xl px-4 py-2 w-[70%] text-lg placeholder:text-base">Create Account</button>
            </form>
            <p>Already have an account? <Link to="/login" className="text-blue-600">Login here</Link></p>
          </div>
          
        </div>
        </div>
    );
}

export default UserSignup;