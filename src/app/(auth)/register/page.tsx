import { RegisterForm } from "@/components/auth/register-form";

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  const isIndividual = params.type === "individual";

  return <RegisterForm isIndividual={isIndividual} />;
}
