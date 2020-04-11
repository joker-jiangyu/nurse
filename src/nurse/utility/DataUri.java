package nurse.utility;

import java.net.URI;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import java.util.Base64;

public class DataUri {
        protected static final Pattern regex = Pattern.compile("^data:(.*?);base64,(.*)", Pattern.CASE_INSENSITIVE);
        protected byte[] data;
        protected String contentType;

        /**
         * @param data the binary data
         * @param contentType the content type (e.g. "image/jpeg")
         */
        public DataUri(String contentType, byte[] data) {
                this.contentType = contentType;
                this.data = data;
        }

        /**
         * @param uri the data URI to parse
         * @throws IllegalArgumentException if the given URI is not a valid data URI
         */
        public DataUri(String uri) {
                Matcher m = regex.matcher(uri);
                if (m.find()) {
                        contentType = m.group(1);
                        data = Base64.getDecoder().decode(m.group(2));
                } else {
                        throw new IllegalArgumentException("Invalid data URI: " + uri);
                }
        }

        /**
         * Gets the binary data.
         * @return the binary data or null if not set
         */
        public byte[] getData() {
                return data;
        }

        /**
         * Sets the binary data.
         * @param data the binary data
         */
        public void setData(byte[] data) {
                this.data = data;
        }

        /**
         * Sets the content type.
         * @return the content type (e.g. "image/jpeg")
         */
        public String getContentType() {
                return contentType;
        }

        /**
         * Sets the content type.
         * @param contentType the content type (e.g. "image/jpeg")
         */
        public void setContentType(String contentType) {
                this.contentType = contentType;
        }

        /**
         * Creates a {@link URI} object from this data URI.
         * @return the {@link URI} object
         */
        public URI toUri() {
                return URI.create(toString());
        }

        @Override
        public String toString() {
                return "data:" + contentType + ";base64," + Base64.getEncoder().encode(data);
        }
}