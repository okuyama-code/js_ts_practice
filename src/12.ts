const userProfile = {
  name: "奥山",
  age: 30,
  contact: {
    email: "oo@gmail.com",
    phone: "09033334444"
  },
  address: {
    city: "足立区",
    state: "JP",
    postalCode: "4579537"
  },
  preferences: {
    theme: "dark",
    notifications: {
      email: true,
      sms: false
    }
  }
};

const { name: userName, age, contact: { email, phone}, address: { city, state }, preferences: { theme, notifications: {email: emailNotifi, sms}} } = userProfile;

console.log("userName", userName)
console.log("age", age)
console.log("email", email)
console.log("phone", phone)
console.log("city", city)
console.log("state", state)
console.log("preferences", theme, emailNotifi, sms)