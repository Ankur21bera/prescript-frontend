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

  /* 🔝 Scroll to top */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* Fetch profile */
  useEffect(() => {
    if (token) dispatch(fetchProfile());
  }, [token, dispatch]);

  /* Sync user data */
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
        setUserData(res.payload.updatedUser);
        setImageFile(null);
        setIsEdit(false);
        toast.success("Profile Updated Successfully");
      })
      .catch(() => toast.error("Failed To Update Profile"));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Card className="p-4 sm:p-6">

        {/* PROFILE IMAGE */}
        <div className="flex flex-col items-center text-center">
          <img
            src={imageFile ? URL.createObjectURL(imageFile) : userData.image}
            alt=""
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border"
          />

          {isEdit && (
            <label className="mt-3 cursor-pointer">
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
              <span className="text-sm text-blue-600 hover:underline">
                Change Profile Photo
              </span>
            </label>
          )}

          {isEdit ? (
            <TextInput
              className="mt-3 w-full sm:w-64 text-center"
              value={userData.name}
              onChange={(e) =>
                setUserData({ ...userData, name: e.target.value })
              }
            />
          ) : (
            <h2 className="mt-3 text-xl font-semibold">{userData.name}</h2>
          )}
        </div>

        <hr className="my-6" />

        {/* PROFILE DETAILS */}
        <div className="space-y-4">

          <ProfileRow
            label="Email"
            value={userData.email}
            disabled
          />

          <ProfileRow
            label="Phone"
            isEdit={isEdit}
            value={userData.phone}
            onChange={(v) =>
              setUserData({ ...userData, phone: v })
            }
          />

          {/* Address */}
          <div className="space-y-2">
            <p className="font-semibold">Address</p>

            {isEdit ? (
              <>
                <TextInput
                  placeholder="Address Line 1"
                  value={userData.address?.line1 || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      address: {
                        ...userData.address,
                        line1: e.target.value,
                      },
                    })
                  }
                />
                <TextInput
                  placeholder="Address Line 2"
                  value={userData.address?.line2 || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      address: {
                        ...userData.address,
                        line2: e.target.value,
                      },
                    })
                  }
                />
              </>
            ) : (
              <p className="text-gray-700">
                {userData.address?.line1}
                <br />
                {userData.address?.line2}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <p className="font-semibold mb-1">Gender</p>
            {isEdit ? (
              <select
                className="w-full border rounded-md p-2"
                value={userData.gender}
                onChange={(e) =>
                  setUserData({ ...userData, gender: e.target.value })
                }
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            ) : (
              <p>{userData.gender}</p>
            )}
          </div>

          <ProfileRow
            label="Date of Birth"
            isEdit={isEdit}
            type="date"
            value={userData.dob}
            onChange={(v) =>
              setUserData({ ...userData, dob: v })
            }
          />
        </div>

        {/* ACTION BUTTON */}
        <div className="mt-8 flex justify-center">
          {isEdit ? (
            <Button onClick={handleUpdate} className="w-40">
              Save Changes
            </Button>
          ) : (
            <Button onClick={() => setIsEdit(true)} className="w-40">
              Edit Profile
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

/* Reusable row */
const ProfileRow = ({
  label,
  value,
  onChange,
  isEdit,
  type = "text",
  disabled,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <p className="sm:w-32 font-semibold">{label}</p>
      {isEdit && !disabled ? (
        <TextInput
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      ) : (
        <p className="text-gray-700 break-words">{value}</p>
      )}
    </div>
  );
};

export default Myprofile;
