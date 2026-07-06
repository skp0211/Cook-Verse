import { Redirect } from "expo-router";
import { ROUTES } from "../constants/routes";

export default function NotFound() {
  return <Redirect href={ROUTES.root} />;
}
