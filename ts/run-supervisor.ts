import Supervisor from "./supervisor/supervisor";
import { how_many_bots } from "./const";

const supervisor = new Supervisor({
    shardAmount: how_many_bots
});