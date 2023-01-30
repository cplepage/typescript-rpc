import createHandler from "typescript-rpc/createHandler";
import {createServer} from "http";

const nav = `<div>
    <style>*{font-family: sans-serif}</style>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/blog">Blog</a>
</div>`

const articles: {
    title: string,
    slug: string,
    content: string
}[] = [
    {
        title: "First Article",
        slug: "first",
        content: "This is the first article"
    },
    {
        title: "Second Article",
        slug: "second",
        content: "This is the second article"
    },
    {
        title: "Third Article",
        slug: "third",
        content: "This is the third article"
    }
];

const blogHeader = `
    ${nav}
    <h1>Blog</h1>
    <div>Articles</div>
    <ul>
        ${articles.map(({title, slug}) => `<li><a href="/blog/${slug}">${title}</a></li>`).join("")}
    </ul>`

let articleMap = {}
articles.forEach(({title, slug, content}) => {
    articleMap[slug] = () => `<div>
        ${blogHeader}
        <h3>${title}</h3>
        <p>${content}</p>
    </div>`
})

const site = {
    "": () => {
        return `<div>
            ${nav}
            <h1>Home</h1>
        </div>`;
    },
    about(){
        return `<div>
            ${nav}
            <h1>About</h1>
        </div>`
    },
    blog: {
        "" : () => `<div>
            ${blogHeader}
            <div>Welcome to the blog</div>
        </div>`,
        ...articleMap
    }
}

const handler = createHandler(site);
createServer((req, res) => {
    if(handler(req, res)) return;

    res.writeHead(404);
    res.end("Not Found");
}).listen(8000);

console.log("Listening at http://localhost:8000")
