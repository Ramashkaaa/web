import request from "supertest";
import app from "../server.js";
import { generateToken } from "../utils.js";
import Message from "../models/messageModel.js";

export const messageTests = () => {
	it("should return all messages", async () => {
		const user = {
			id: 1,
			name: "Julia",
			email: "julia@test.com",
			password: "randomHash",
			isAdmin: false,
		};
		const userAdmin = {
			id: 2,
			name: "Nastya",
			email: "Nastya@test.com",
			password: "randomHash",
			isAdmin: true,
		};
		const messages = [
			{
				id: 1,
				message: "hello",
				roomId: 1,
				userId: 1,
				user,
			},
			{
				id: 2,
				message: "hi",
				roomId: 1,
				userId: 2,
				user: userAdmin,
			},
		];
		const userToken = generateToken(user);

		jest.spyOn(Message, "findAll").mockReturnValue(messages);

		const res = await request(app)
			.get("/api/message/all")
			.set("Authorization", `Bearer ${userToken}`)
			.send();
		expect(res.statusCode).toEqual(200);
		expect(res.body).toMatchObject(messages);
	});

	it("should return 401 if user is not an admin or owner of the room", async () => {
		const res = await request(app).get("/api/message/all");
		expect(res.statusCode).toEqual(401);
	});
};
