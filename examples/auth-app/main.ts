import {client} from "./client";

const root = document.querySelector("#root");

function renderLogin(){
    const form = document.createElement("form");
    form.innerHTML = `
        <label>Username</label><br />
        <input id="username" /><br />
        
        <label>Password</label><br />
        <input id="password" type="password" /><br />
        
        <input id="submit" type="submit" />
    `;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = (document.querySelector("#submit") as HTMLInputElement);

        const username = (document.querySelector("#username") as HTMLInputElement).value;
        const password = (document.querySelector("#password") as HTMLInputElement).value;

        if(submitBtn.value === "Register"){
            await client.post().login.register(username, password);
        }

        const response = await client.post().login.login(username, password);

        if(response.token){
            window.localStorage.setItem("token", response.token);
            window.location.reload();
            return;
        }

        alert(response.error);

        if(response.code !== 2) return;

        submitBtn.value = "Register";
    });
    root.replaceChildren(form);
}


async function renderUser(){
    const user = await client.get().users.get();

    const form = document.createElement("form");
    form.innerHTML = `
        <label>ID</label><br />
        ${user.id}<br />
        
        <label>Username</label><br />
        <input id="username" value="${user.username}" /><br />
        
        <label>Age</label><br />
        <input id="age" value="${user?.age ?? ""}" /><br />
        
        <label>Interest (split with comma)</label><br />
        <textarea id="interest">${user.interest?.join(", ") ?? ""}</textarea><br />
        
        <input type="submit" value="Update" />
    `;

    form.addEventListener('submit', async e => {
        e.preventDefault();

        const username = (document.querySelector("#username") as HTMLInputElement).value;
        const age = (document.querySelector("#age") as HTMLInputElement).value;
        const interest = (document.querySelector("#interest") as HTMLInputElement).value;

        await client.put().users.update({
            id: user.id,
            username,
            age: parseInt(age),
            interest: interest.split(",").map(item => item.trim())
        });

        alert("User updated!");
    });

    root.replaceChildren(form);

    const logoutBtn = document.createElement("button");
    logoutBtn.innerText = "Logout";
    logoutBtn.addEventListener("click", async () => {
        await client.post().login.logout();
        window.localStorage.removeItem("token");
        window.location.reload();
    });
    root.appendChild(logoutBtn);
}


export default async function main(){

    const token = window.localStorage.getItem("token");

    if(!token || !(await client.post().login.verify(token))?.userId){
        renderLogin();
        return;
    }

    client.headers = {
        ...client.headers,
        authorization: token
    }

    return renderUser();
}
