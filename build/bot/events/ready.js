import { GuardsmanState } from "../../index.js";
export default (guardsman) => {
    guardsman.log.info("Console ready.");
    guardsman.state = GuardsmanState.ONLINE;
};
