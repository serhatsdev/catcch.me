import styles from "./AuthForm.module.css";
import { Button, Form } from "react-bootstrap";
import cx from "classnames";
import { useEffect, useState } from "react";
import { getCsrfToken, getProviders } from "next-auth/react";
import { useRouter } from "next/router";

type SupportedProviderId = keyof typeof supportedProviders;

const supportedProviders = {
  google: {
    name: "Google",
    Icon: () => (
      <svg
        fill="currentColor"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        className="me-2"
      >
        <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"></path>
      </svg>
    ),
  },
};

type Props = {
  title: string;
  description?: string | React.ReactElement;
  providerButtonTextPrefix: string;
  className?: string;
};

const AuthForm: React.FC<Props> = ({
  title,
  description,
  providerButtonTextPrefix,
  className,
}) => {
  const [csrfToken, setCsrfToken] = useState<string | undefined>();
  const [providerIds, setProviderIds] = useState<SupportedProviderId[]>([]);
  const router = useRouter();

  useEffect(() => {
    getCsrfToken().then((csrfToken) => {
      if (!csrfToken) {
        router.push("/api/auth/error?error=default");
      }

      setCsrfToken(csrfToken);
    });

    getProviders().then((providers) => {
      if (!providers) return;
      const providerIds = Object.keys(providers).filter((id) =>
        Object.keys(supportedProviders).includes(id)
      );

      setProviderIds(providerIds as SupportedProviderId[]);
    });
  }, [router]);

  return (
    <div className={cx(styles.AuthForm, "shadow", className)}>
      <h1>{title}</h1>
      {description && <p className="lead">{description}</p>}
      <Form action="/api/auth/signin/email" method="POST">
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <Form.Group className="mb-3 mt-2" controlId="formEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            name="email"
            type="email"
            placeholder="Enter email"
            required
          />
        </Form.Group>
        <Button type="submit" variant="dark">
          {providerButtonTextPrefix} Email
        </Button>
      </Form>
      {providerIds.length > 0 && (
        <>
          <div className={styles.AuthFormDivider}>
            <hr />
            <span>or</span>
          </div>

          {providerIds
            .map((id) => ({ id, p: supportedProviders[id] }))
            .map(({ id, p: { name, Icon } }) => (
              <>
                <Button
                  key={id}
                  className={cx(styles.OAuthButton, "mb-3")}
                  variant="dark"
                >
                  <Icon />
                  {providerButtonTextPrefix} {name}
                </Button>
              </>
            ))}
        </>
      )}
    </div>
  );
};

export default AuthForm;
