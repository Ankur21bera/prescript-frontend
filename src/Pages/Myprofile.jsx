import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfile } from "../redux/doctor";
import toast from "react-hot-toast";
import { Button, Card, TextInput } from "flowbite-react";

const Myprofile = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.doctor);
  const [isEdit, setIsEdit] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: { line1: "", line2: "" },
    gender: "",
    dob: "",
    image: "",
  });
  useEffect(() => {
    if (token) {
      dispatch(fetchProfile());
    }
  }, [token]);

  useEffect(() => {
    if (user) setUserData(user);
  }, [user]);

  const handleUpdate = () => {
  const formData = new FormData();
  formData.append("name", userData.name);
  formData.append("phone", userData.phone);
  formData.append("dob", userData.dob);
  formData.append("gender", userData.gender);
  formData.append("address", JSON.stringify(userData.address));
  if (imageFile) formData.append("image", imageFile);

  dispatch(updateProfile(formData))
    .then((res) => {
      const updatedUser = res.payload.updatedUser; 
      setUserData(updatedUser);  
      setImageFile(null);        
      toast.success("Profile Updated Successfully");
    })
    .catch(() => {
      toast.error("Failed To Update Profile");
    });
};

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="shadow-lg p-6">
        <div className="flex flex-col items-center text-center">
          <img
            className="w-32 h-32 rounded-full border shadow object-cover"
            src={imageFile ? URL.createObjectURL(imageFile) : userData.image}
            alt=""
          />
          {isEdit && (
            <label className="mt-3 flex flex-col items-center justify-center w-full cursor-pointer">
              <div className="flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl px-4 py-3 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M3 16.5v-9A2.25 2.25 0 015.25 5h13.5A2.25 2.25 0 0121 7.5v9M3 16.5l6.664-6.664a2.25 2.25 0 013.182 0L21 16.5"
                  />
                </svg>

                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-medium text-blue-600">
                    Click to upload
                  </span>{" "}
                  or drag & drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG (Max 2MB)
                </p>
              </div>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </label>
          )}
          {isEdit ? (
            <TextInput
              className="mt-3 w-60 text-center"
              value={userData.name}
              onChange={(e) =>
                setUserData({ ...userData, name: e.target.value })
              }
            />
          ) : (
            <p className="text-2xl font-semibold mt-3">{userData.name}</p>
          )}
        </div>
        <hr className="my-6" />

        <div className="grid gap-5">
          <ProfileRow
            label="Name"
            isEdit={isEdit}
            value={userData.name}
            onChange={(v) => setUserData({ ...userData, name: v })}
          />
          <div className="flex">
            <ProfileRow label="Email" disabled />{" "}
            <p className="ml-[-48px] sm:ml-[2px]">{userData.email}</p>
          </div>
          <ProfileRow
            label="Phone"
            isEdit={isEdit}
            value={userData.phone}
            onChange={(e) => setUserData({ ...userData, phone: e })}
          />
          <div className="grid grid-cols-[120px_1fr] gap-3 items-start">
            <p className="font-semibold">Address:</p>

            {isEdit ? (
              <div className="space-y-2">
                <TextInput
                  value={userData?.address?.line1 || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      address: { ...userData.address, line1: e.target.value },
                    })
                  }
                />
                <TextInput
                  value={userData?.address?.line2 || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      address: { ...userData.address, line2: e.target.value },
                    })
                  }
                />
              </div>
            ) : (
              <p className="text-gray-700">
                {userData?.address?.line1 || ""}
                <br />
                {userData?.address?.line2 || ""}
              </p>
            )}
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-3">
            <p className="font-semibold">Gender:</p>
            {isEdit ? (
              <select
                value={userData.gender}
                onChange={(e) =>
                  setUserData({ ...userData, gender: e.target.value })
                }
              >
                <option>Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            ) : (
              <p>{userData.gender}</p>
            )}
          </div>
          <ProfileRow
            label="DOB"
            isEdit={isEdit}
            type="date"
            value={userData.dob}
            onChange={(v) => setUserData({ ...userData, dob: v })}
          />
        </div>
        <div className="mt-8 flex justify-center">
          {isEdit ? (
            <Button
              onClick={handleUpdate}
              color="blue"
              className="w-40 cursor-pointer"
            >
              Save
            </Button>
          ) : (
            <Button
              onClick={() => setIsEdit(true)}
              className="w-40 cursor-pointer"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

const ProfileRow = ({
  label,
  value,
  onChange,
  isEdit,
  type = "text",
  disabled,
}) => {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
      <p className="font-semibold">{label}:</p>
      {isEdit && !disabled ? (
        <TextInput
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p className="text-gray-700 break-all">{value}</p>
      )}
    </div>
  );
};

export default Myprofile;
