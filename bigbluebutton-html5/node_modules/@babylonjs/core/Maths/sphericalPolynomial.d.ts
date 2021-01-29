import { Vector3 } from "../Maths/math.vector";
import { Color3 } from '../Maths/math.color';
/**
 * Class representing spherical harmonics coefficients to the 3rd degree
 */
export declare class SphericalHarmonics {
    /**
     * Defines whether or not the harmonics have been prescaled for rendering.
     */
    preScaled: boolean;
    /**
     * The l0,0 coefficients of the spherical harmonics
     */
    l00: Vector3;
    /**
     * The l1,-1 coefficients of the spherical harmonics
     */
    l1_1: Vector3;
    /**
     * The l1,0 coefficients of the spherical harmonics
     */
    l10: Vector3;
    /**
     * The l1,1 coefficients of the spherical harmonics
     */
    l11: Vector3;
    /**
     * The l2,-2 coefficients of the spherical harmonics
     */
    l2_2: Vector3;
    /**
     * The l2,-1 coefficients of the spherical harmonics
     */
    l2_1: Vector3;
    /**
     * The l2,0 coefficients of the spherical harmonics
     */
    l20: Vector3;
    /**
     * The l2,1 coefficients of the spherical harmonics
     */
    l21: Vector3;
    /**
     * The l2,2 coefficients of the spherical harmonics
     */
    l22: Vector3;
    /**
     * Adds a light to the spherical harmonics
     * @param direction the direction of the light
     * @param color the color of the light
     * @param deltaSolidAngle the delta solid angle of the light
     */
    addLight(direction: Vector3, color: Color3, deltaSolidAngle: number): void;
    /**
     * Scales the spherical harmonics by the given amount
     * @param scale the amount to scale
     */
    scaleInPlace(scale: number): void;
    /**
     * Convert from incident radiance (Li) to irradiance (E) by applying convolution with the cosine-weighted hemisphere.
     *
     * ```
     * E_lm = A_l * L_lm
     * ```
     *
     * In spherical harmonics this convolution amounts to scaling factors for each frequency band.
     * This corresponds to equation 5 in "An Efficient Representation for Irradiance Environment Maps", where
     * the scaling factors are given in equation 9.
     */
    convertIncidentRadianceToIrradiance(): void;
    /**
     * Convert from irradiance to outgoing radiance for Lambertian BDRF, suitable for efficient shader evaluation.
     *
     * ```
     * L = (1/pi) * E * rho
     * ```
     *
     * This is done by an additional scale by 1/pi, so is a fairly trivial operation but important conceptually.
     */
    convertIrradianceToLambertianRadiance(): void;
    /**
     * Integrates the reconstruction coefficients directly in to the SH preventing further
     * required operations at run time.
     *
     * This is simply done by scaling back the SH with Ylm constants parameter.
     * The trigonometric part being applied by the shader at run time.
     */
    preScaleForRendering(): void;
    /**
     * Constructs a spherical harmonics from an array.
     * @param data defines the 9x3 coefficients (l00, l1-1, l10, l11, l2-2, l2-1, l20, l21, l22)
     * @returns the spherical harmonics
     */
    static FromArray(data: ArrayLike<ArrayLike<number>>): SphericalHarmonics;
    /**
     * Gets the spherical harmonics from polynomial
     * @param polynomial the spherical polynomial
     * @returns the spherical harmonics
     */
    static FromPolynomial(polynomial: SphericalPolynomial): SphericalHarmonics;
}
/**
 * Class representing spherical polynomial coefficients to the 3rd degree
 */
export declare class SphericalPolynomial {
    private _harmonics;
    /**
     * The spherical harmonics used to create the polynomials.
     */
    get preScaledHarmonics(): SphericalHarmonics;
    /**
     * The x coefficients of the spherical polynomial
     */
    x: Vector3;
    /**
     * The y coefficients of the spherical polynomial
     */
    y: Vector3;
    /**
     * The z coefficients of the spherical polynomial
     */
    z: Vector3;
    /**
     * The xx coefficients of the spherical polynomial
     */
    xx: Vector3;
    /**
     * The yy coefficients of the spherical polynomial
     */
    yy: Vector3;
    /**
     * The zz coefficients of the spherical polynomial
     */
    zz: Vector3;
    /**
     * The xy coefficients of the spherical polynomial
     */
    xy: Vector3;
    /**
     * The yz coefficients of the spherical polynomial
     */
    yz: Vector3;
    /**
     * The zx coefficients of the spherical polynomial
     */
    zx: Vector3;
    /**
     * Adds an ambient color to the spherical polynomial
     * @param color the color to add
     */
    addAmbient(color: Color3): void;
    /**
     * Scales the spherical polynomial by the given amount
     * @param scale the amount to scale
     */
    scaleInPlace(scale: number): void;
    /**
     * Gets the spherical polynomial from harmonics
     * @param harmonics the spherical harmonics
     * @returns the spherical polynomial
     */
    static FromHarmonics(harmonics: SphericalHarmonics): SphericalPolynomial;
    /**
     * Constructs a spherical polynomial from an array.
     * @param data defines the 9x3 coefficients (x, y, z, xx, yy, zz, yz, zx, xy)
     * @returns the spherical polynomial
     */
    static FromArray(data: ArrayLike<ArrayLike<number>>): SphericalPolynomial;
}
