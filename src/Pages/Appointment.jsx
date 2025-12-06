import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { assets } from "../assets/assets";
import RelatedDoctors from "../Components/Realteddoctors";
import { backendUrl, fetchDoctors } from "../redux/doctor";
import toast from "react-hot-toast";
import axios from "axios";

const Appointments = () => {
  const { docId } = useParams();
  
  
  const doctors = useSelector((state) => state.doctor.doctors); 
  const token = useSelector((state) => state.doctor.token);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [loadingBtn, setLoadingBtn] = useState(false); 
  const dispatch = useDispatch();
  const navigate = useNavigate();


  useEffect(() => {
  if (doctors.length === 0) {
    dispatch(fetchDoctors());
  }
}, [dispatch,doctors.length]);

  const fetchDocInfo = () => {
    const info = doctors?.find((doc) => doc._id === docId);
    setDocInfo(info || null);
  };

  const getAvailableSlots = () => {
    if (!docInfo) return;

    setDocSlots([]);

    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date(today);
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (i === 0) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let slots = [];

      while (currentDate < endTime) {
        slots.push({
          datetime: new Date(currentDate),
          time: currentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots((prev) => [...prev, slots]);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  useEffect(()=>{
    window.scrollTo(0,0)
  },[])

  const handleBooking = async () => {
    if(!token){
      toast.error("Please Login First");
      navigate('/login')
      return;
    }
    if(!slotTime){
      toast.error("Please Select Slot")
      return;
    }
    const selectedSlot = docSlots[slotIndex]?.find((s)=>s.time === slotTime);
    if(!selectedSlot){
      toast.error("Invalid Slot Selected")
      return;
    }
    try {
      setLoadingBtn(true);
      const response = await axios.post(`${backendUrl}api/user/book-appointment`,{
          docId: docId,
          slotDate: selectedSlot.datetime.toDateString(),
          slotTime: slotTime,
      },{headers:{Authorization:`Bearer ${token}`}});
      setLoadingBtn(false);
      if(response.data.success){
        toast.success("Appointment booked successfully!");
        navigate('/my-appointments')
      } else{
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
       setLoadingBtn(false);
      toast.error("Server error");
      console.log(error);
    }
  }

  if (!docInfo) {
    return (
      <div className="text-center py-20 text-gray-500 text-lg">
        Loading doctor details…
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-20">

      {/* Doctor Info */}
      <div className="flex flex-col sm:flex-row gap-6">
        <img
          src={docInfo.image}
          alt={docInfo.name}
          className="w-full sm:w-60 h-auto rounded-xl shadow-md object-cover"
        />

        <div className="flex-1 border rounded-xl p-6 bg-white shadow-sm">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            {docInfo.name}
            <img src={assets.verified_icon} className="w-5" alt="verified" />
          </h2>

          <div className="text-gray-600 mt-1 flex gap-2 text-sm">
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <span className="px-2 py-0.5 text-xs border rounded-full bg-gray-100">
              {docInfo.experience}
            </span>
          </div>

          <div className="mt-4">
            <p className="font-medium text-gray-700 flex items-center gap-1">
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className="text-gray-500 text-sm mt-1">{docInfo.about}</p>
          </div>

          <p className="text-gray-700 font-medium mt-4">
            Appointment Fee:{" "}
            <span className="text-blue-600 font-semibold">${docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* Slots */}
      <div className="mt-10">
        <p className="text-lg font-semibold text-gray-700">Available Slots</p>

        {/* Date Selector */}
        <div className="flex gap-4 overflow-x-auto mt-4 pb-2">
          {docSlots.map((slots, index) => (
            <div
              key={index}
              onClick={() => {
                setSlotIndex(index);
                setSlotTime("");
              }}
              className={`min-w-20 px-4 py-4 rounded-xl text-center cursor-pointer 
              ${slotIndex === index ? "bg-blue-600 text-white" : "border border-gray-300 bg-white"}
              shadow-sm`}
            >
              <p className="text-sm">{slots[0] && daysOfWeek[slots[0].datetime.getDay()]}</p>
              <p className="text-lg font-semibold">{slots[0] && slots[0].datetime.getDate()}</p>
            </div>
          ))}
        </div>

        {/* Time Selector */}
        <div className="flex gap-3 overflow-x-auto mt-5 pb-2">
          {docSlots[slotIndex]?.map((slot, idx) => (
            <p
              key={idx}
              onClick={() => setSlotTime(slot.time)}
              className={`px-6 py-2 rounded-full text-sm border cursor-pointer whitespace-nowrap 
              ${slot.time === slotTime ? "bg-blue-600 text-white" : "border-gray-300 text-gray-600"}`}
            >
              {slot.time.toLowerCase()}
            </p>
          ))}
        </div>

        <button onClick={handleBooking} disabled={loadingBtn} className="bg-blue-600 text-white px-10 py-3 cursor-pointer rounded-full mt-6 hover:bg-blue-700 transition">
          {loadingBtn ? "Booking..." : "Book Appointment"}
        </button>
      </div>
      <RelatedDoctors doc={docId} speciality={docInfo.speciality}/>
    </div>
  );
};

export default Appointments;
