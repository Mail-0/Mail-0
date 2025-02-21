import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  async function loadGoogleFont(font: string) {
    const url = `https://fonts.googleapis.com/css2?family=${font}:wght@600&display=swap`;
    const css = await (await fetch(url)).text();
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

    if (resource) {
      const response = await fetch(resource[1]);
      if (response.status === 200) {
        return await response.arrayBuffer();
      }
    }

    throw new Error("failed to load font data");
  }

  const mailBuffer = await fetch(
    new URL("../../../../public/assets/mail.svg", import.meta.url),
  ).then((res) => res.arrayBuffer());
  const mailBase64 = Buffer.from(mailBuffer).toString("base64");
  const mail = `data:image/svg+xml;base64,${mailBase64}`;

  const rocketBuffer = await fetch(
    new URL("../../../../public/assets/rocket.svg", import.meta.url),
  ).then((res) => res.arrayBuffer());
  const rocketBase64 = Buffer.from(rocketBuffer).toString("base64");
  const rocket = `data:image/svg+xml;base64,${rocketBase64}`;

  const fontData = await loadGoogleFont("Geist");

  return new ImageResponse(
    (
      <div tw="text-white bg-black w-full py-4 px-10 h-full flex items-center justify-center flex-col">
        <div tw="opacity-10 absolute -bottom-24 -right-14 flex flex-col items-center justify-center">
          <img src={rocket} width="32" height="32" alt="rocket" />
        </div>
        <div tw="flex flex-col font-normal items-center justify-center">
          <div tw="flex mb-8 rounded-xl w-60 border-white p-4 items-center">
            <div tw="flex items-center rounded-lg bg-white/20 justify-center border-2 border-white p-2">
              <img src={mail} width="32" height="32" alt="mail" />
            </div>
            <h3 tw="ml-4 text-4xl border-l-2 px-4 border-white font-extrabold">Mail0</h3>
          </div>
          <div tw="flex flex-col items-center justify-center">
            <div tw="flex">
              <span tw="font-extrabold text-7xl">Your</span>
              <span style={{ fontFamily: "main-bold" }} tw="font-extrabold text-7xl text-[#fff]">
                open source
              </span>
            </div>
            <span tw="font-bold text-7xl">email alternative</span>
          </div>

          <div tw="text-3xl text-center font-medium text-neutral-400 w-[80%] mt-10">
            Connect and take control of your email with an open source, secure, and customizable
            platform built for everyone.
          </div>
          <div tw="text-3xl rounded-xl mt-16 text-primary w-[16rem] flex items-center justify-center h-20">
            <span tw="mr-2 border-2 border-white w-full h-16 bg-white/20 rounded-lg flex items-center justify-center">
              Register Now
            </span>
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #fff  100%, #ffff  100%)",
            width: "20rem",
            height: "20rem",
            filter: "blur(180px)",
            borderRadius: "50%",
            display: "flex",
            position: "absolute",
            bottom: "-100px",
            left: "-40px",
            opacity: "0.2",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "main",
          }}
        ></div>
        <div
          style={{
            background: "linear-gradient(135deg, #fff  100%, #fff  100%)",
            width: "20rem",
            height: "20rem",
            filter: "blur(180px)",
            borderRadius: "50%",
            display: "flex",
            position: "absolute",
            top: "33%",
            right: "-40px",
            opacity: "0.4",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "main",
          }}
        ></div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "main",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
