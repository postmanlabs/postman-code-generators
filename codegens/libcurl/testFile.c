#include <stdio.h>
#include <string.h>
#include <curl/curl.h>
int main(int argc, char *argv[]){
	CURL *curl;
	CURLcode res;
	curl = curl_easy_init();
	if(curl) {
		curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "POST");
		curl_easy_setopt(curl, CURLOPT_URL, "https://postman-echo.com/post/?hardik=%22me%22");
		curl_easy_setopt(curl, CURLOPT_DEFAULT_PROTOCOL, "https");
		struct curl_slist *headers = NULL;
		headers = curl_slist_append(headers, "Content-Type: application/x-www-form-urlencoded");
		curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
		const char *data = "1=a&2=b&%22%2212%22%22=%2223%22&%271%222%5C%22%223%27=%271%2223%224%27";
		curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data);
		res = curl_easy_perform(curl);
		if(res == CURLE_OK) {
			long response_code;
			curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &response_code);
			if(!res && response_code) printf("%03ld", response_code);
		}
	}
	curl_easy_cleanup(curl);
	return (int)res;
}