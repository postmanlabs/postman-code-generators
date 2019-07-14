import java.io.*;
import okhttp3.*;
public class main {
public static void main(String []args) throws IOException{
OkHttpClient client = new OkHttpClient().newBuilder()
   .build();
MediaType mediaType = MediaType.parse("text/plain");
RequestBody body = new MultipartBody.Builder().setType(MultipartBody.FORM)
   .addFormDataPart("fdjks", "dsf")
   .addFormDataPart("sdf", "")
   .addFormDataPart("12", "\"23\"")
   .addFormDataPart("'123'", "'\"23\\\"4\\\"\"'")
   .build();
Request request = new Request.Builder()
   .url("https://postman-echo.com/post")
   .method("POST", body)
   .build();
Response response = client.newCall(request).execute();System.out.println(response.body().string());
}
}
