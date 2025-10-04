export const register = (req,res) => {
    const {name,password,email,education,role,phone} = req.body;
    console.log(name)
    console.log(email)
    console.log(password)
    console.log(role)
    console.log(phone)
    // console.log(photo)
    console.log(education)
}