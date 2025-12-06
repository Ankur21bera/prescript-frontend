import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors } from "../redux/doctor";

const Doctors = () => {
  const { speciality } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  

  const { doctors } = useSelector((state) => state.doctor);
  
    useEffect(() => {
      dispatch(fetchDoctors());
    }, [dispatch]);
  

  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const specialityList = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist",
  ];

  useEffect(() => {
    if (speciality) {
      setFilteredDoctors(
        doctors.filter((doc) => doc.speciality === speciality)
      );
    } else {
      setFilteredDoctors(doctors);
    }
  }, [speciality, doctors]);

  return (
    <div className="my-10 px-4 text-gray-800">
      <p className="text-sm text-gray-600">
        Browse through our list of trusted specialist doctors.
      </p>

      <div className="flex flex-col sm:flex-row gap-6 mt-6">

        {/* Left Sidebar */}
        <div className="flex flex-col gap-3 text-sm sm:w-60 w-full">
          {specialityList.map((item, index) => (
            <p
              key={index}
              onClick={() =>
                speciality === item
                  ? navigate("/doctors")
                  : navigate(`/doctors/${item}`)
              }
              className={`pl-4 py-2 border rounded-lg cursor-pointer transition-all
                ${
                  speciality === item
                    ? "bg-blue-500 text-white border-blue-600 shadow"
                    : "hover:bg-blue-50 hover:border-blue-300"
                }`}
            >
              {item}
            </p>
          ))}
        </div>


        <div className="w-full grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
          {filteredDoctors.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(`/appointment/${item._id}`)}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer
              hover:translate-y-1 hover:shadow-lg transition-all duration-300 bg-white"
            >
              <img className="w-full bg-blue-50" src={item.image} alt={item.name} />

              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-green-500 mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <p>Available</p>
                </div>

                <p className="text-gray-900 font-semibold text-lg">
                  {item.name}
                </p>
                <p className="text-gray-600 text-sm">{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Doctors;
