export const doesUserExist = async (user) => {
    try {
        console.log("Checking if user exists: ", user);
        return { success: true };
    } catch (error) {
        console.error("doesUserExist error:", error);
        return { success: false, error: "Failed to check if user exists" };
    }
};

export const createNewUser = async (user) => {
    try {
        console.log("creating new user: ", user);
        return { success: true };
    } catch (error) {
        console.error("createNewUser error:", error);
        return { success: false, error: "Failed to create new user" };
    }
};
