import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { userValidationMessages } from "App/Enums/ValidationMessages";
import User from "App/Models/User";

export default class UpdateUsersController {
  public async handle({ request, response }: HttpContextContract) {
    const newUserSchema = schema.create({
      id: schema.number(),
      nome: schema.string.optional({ trim: true }),
      email: schema.string.optional([rules.email()]),
    });

    const { id, nome, email } = await request.validate({
      schema: newUserSchema,
      messages: userValidationMessages,
    });

    const user = await User.findOrFail(id);
    await user.merge({ nome, email }).save();

    response.send({
      success: true,
      user: user.toJSON(),
    });
  }
}
