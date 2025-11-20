import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import Games from "@/app/components/Games";

export default function Home() {
  return (
    <>
      <Header />

      <Games />
    </>
  );
}
