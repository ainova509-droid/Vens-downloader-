import { router, publicProcedure } from "./trpc";
import { COOKIE_NAME } from "../../shared/const";

export const authRouter = router({
  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie(COOKIE_NAME, {
      maxAge: -1,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
    
    return { success: true };
  }),
});
