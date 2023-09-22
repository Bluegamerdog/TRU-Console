import { Guardsman, GuardsmanState } from "../../index.js";

export default (guardsman: Guardsman) => {
    guardsman.log.info("Console ready.")
    guardsman.state = GuardsmanState.ONLINE;
}