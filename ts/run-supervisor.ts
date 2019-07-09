/**
 * This script is a wrapper for the supervisor class, run it via node run-supervisor.js
 */

import Supervisor from "./supervisor/supervisor";
import { how_many_bots } from "./const";

const supervisor = new Supervisor({
    shardAmount: how_many_bots
});