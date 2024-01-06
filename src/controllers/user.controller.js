import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloundinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';


const registerUser = asyncHandler(async (req, res)=>{

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const  {username, email, password, fullName} = await  req.body;
 

    if([username,fullName,email,password].some((field)=>field?.trim() === "")){
        throw new ApiError(400,"All field required !!!")
    }

    const existedUser = await User.findOne({
        $or : [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(400,"User  with email or username already exists !!!");
    }

    const avatarLocalPath =  req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required Local");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required Avatar");
    }

    const user = await User.create({
        username,
        email,
        password,
        fullName,
        avatar: avatar.url || '',
        coverImage : coverImage.url || ''
    })

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createUser){
        throw new ApiError(500,"Something went Wrong While registring")
    }

    return res.status(201).json(
       new ApiResponse(200,createUser," User registred Successfully")
    )
})

export { registerUser };