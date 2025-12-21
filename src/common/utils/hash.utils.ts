import { hash as bcryptHash, compare as compareHash } from "bcrypt";

export const hash = async (
	plainText: string,
	saltRound: number,
): Promise<string> => {
	const saltOrRounds = saltRound || 10;
	return await bcryptHash(plainText, saltOrRounds);
};

export const compare = async (
	plainText: string,
	hash: string
): Promise<boolean> => {
	return await compareHash(plainText, hash);
}
