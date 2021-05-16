import { orderTests } from "./orderRoutes.test.js";
import { productTests } from "./productRoutes.test.js";
import { categoryTests } from "./categoryRoutes.test.js";
import { userTests } from "./userRoutes.test.js";
import { messageTests } from "./messageRoutes.test.js";

describe("Order Tests", orderTests);
describe("Product route", productTests);
describe("Categoty route", categoryTests);
describe("User route", userTests);
describe("Message route", messageTests);
